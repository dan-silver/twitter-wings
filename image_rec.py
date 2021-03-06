import numpy as np
import cv2
from matplotlib import pyplot as plt
import sys

saveComparisonImage = True
showDialog = False

img1 = cv2.imread('../test_images/fox.jpg',0)          # queryImage
img2 = cv2.imread('../test_images/box_scene.png',0) # trainImage

# Initiate SIFT detector
sift = cv2.SIFT()

# find the keypoints and descriptors with SIFT
kp1, des1 = sift.detectAndCompute(img1,None)
kp2, des2 = sift.detectAndCompute(img2,None)

# FLANN parameters
FLANN_INDEX_KDTREE = 0
index_params = dict(algorithm = FLANN_INDEX_KDTREE, trees = 5)
search_params = dict(checks=50)   # or pass empty dictionary

flann = cv2.FlannBasedMatcher(index_params,search_params)

matches = flann.knnMatch(des1,des2,k=2)
# print matches

# print 'there were {} matches'.format(len(matches))

# Need to draw only good matches, so create a mask
matchesMask = [[0,0] for i in xrange(len(matches))]

confirmedMatches = []

# ratio test as per Lowe's paper
for i,(m,n) in enumerate(matches):
    if m.distance < 0.7*n.distance:
        matchesMask[i]=[1,0]
        confirmedMatches.append(matches[i])

for i,(m,n) in enumerate(confirmedMatches):
	#print confirmedMatches[i][0].trainIdx
	confirmedMatches[i] = kp2[confirmedMatches[i][0].trainIdx].pt

# print confirmedMatches
if saveComparisonImage or showDialog:
	draw_params = dict(matchColor = (0,255,0),
                   singlePointColor = (255,0,0),
                   matchesMask = matchesMask,
                   flags = 0)

	img3 = cv2.imread('scene-tri.png',cv2.IMREAD_COLOR)
	for x,y in confirmedMatches:
		cv2.circle(img3, (int(x),int(y)), 20, (40,40,40))
	img3 = cv2.drawMatchesKnn(img1,kp1,img2,kp2,matches,None,**draw_params)
	if saveComparisonImage:
		cv2.imwrite('public/comparison.png', img3)

if showDialog:
	plt.imshow(img3,),plt.show()
	cv2.imshow('image',img3)
	cv2.waitKey(0)
	cv2.destroyAllWindows()

print len(confirmedMatches)
